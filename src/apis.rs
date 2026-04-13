use rocket::serde::json::Json;
use rocket::serde::{Deserialize, Serialize};
use rocket::{State, http::Status};
use sqlx::PgPool;
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2,
};
use std::collections::HashMap;

// ==========================================
// 1. NAUCZYCIEL
// ==========================================

#[derive(Serialize)]
pub struct PrzedmiotResponse {
    pub id_przedmiotu: i32,
    pub nazwa: String,
}

#[get("/nauczyciel/przedmioty")]
pub async fn nauczyciel_lista_przedmiotow(conn: &State<PgPool>) -> Result<Json<Vec<PrzedmiotResponse>>, Status> {
    let przedmioty = sqlx::query_as!(
        PrzedmiotResponse,
        "SELECT id_przedmiotu, nazwa FROM Przedmioty"
    )
    .fetch_all(conn.inner())
    .await;

    match przedmioty {
        Ok(p) => Ok(Json(p)),
        Err(_) => Err(Status::InternalServerError),
    }
}

#[derive(Deserialize)]
pub struct NowaOcenaRequest {
    pub id_ucznia: i32,
    pub id_przedmiotu: i32,
    pub typ_oceny: String, 
    pub waga: i32,         
    pub ocena: f32,
    pub id_nauczyciela: i32, 
}

#[post("/nauczyciel/oceny", data = "<req>")]
pub async fn nauczyciel_dodaj_ocene(
    req: Json<NowaOcenaRequest>,
    conn: &State<PgPool>,
) -> Result<Status, Status> {
    
    // KROK 1: Szukamy id_typu_oceny lub tworzymy nowy
    let szukany_typ = sqlx::query_scalar!(
        "SELECT id_typu_oceny FROM Typy_Ocen WHERE nazwa_oceny = $1 AND waga = $2",
        req.typ_oceny,
        req.waga
    )
    .fetch_optional(conn.inner())
    .await;

    let id_typu_oceny = match szukany_typ {
        Ok(Some(id)) => id, 
        Ok(None) => {
            let nowy_typ = sqlx::query_scalar!(
                "INSERT INTO Typy_Ocen (nazwa_oceny, waga) VALUES ($1, $2) RETURNING id_typu_oceny",
                req.typ_oceny,
                req.waga
            )
            .fetch_one(conn.inner())
            .await;

            match nowy_typ {
                Ok(id) => id,
                Err(e) => {
                    eprintln!("Błąd tworzenia nowego typu oceny: {}", e);
                    return Err(Status::InternalServerError);
                }
            }
        },
        Err(e) => {
            eprintln!("Błąd bazy podczas wyszukiwania typu oceny: {}", e);
            return Err(Status::InternalServerError);
        }
    };

    // KROK 2: Wstawiamy ocenę
    let wstaw_ocene = sqlx::query!(
        "INSERT INTO Oceny (id_ucznia, id_nauczyciela, id_przedmiotu, id_typu_oceny, ocena) 
         VALUES ($1, $2, $3, $4, $5)",
        req.id_ucznia,
        req.id_nauczyciela,
        req.id_przedmiotu,
        id_typu_oceny,      
        req.ocena as f64
    )
    .execute(conn.inner())
    .await;

    match wstaw_ocene {
        Ok(_) => Ok(Status::Created),
        Err(e) => {
            eprintln!("Błąd wstawiania oceny: {}", e);
            Err(Status::InternalServerError)
        }
    }
}

#[derive(Serialize)]
pub struct KlasaResponse {
    pub id_klasy: i32,
    pub nazwa_klasy: String,
}

#[get("/nauczyciel/klasy")]
pub async fn nauczyciel_lista_klas(conn: &State<PgPool>) -> Result<Json<Vec<KlasaResponse>>, Status> {
    let klasy = sqlx::query_as!(
        KlasaResponse,
        "SELECT id_klasy, nazwa_klasy FROM Klasy ORDER BY nazwa_klasy"
    )
    .fetch_all(conn.inner())
    .await;

    match klasy {
        Ok(k) => Ok(Json(k)),
        Err(_) => Err(Status::InternalServerError),
    }
}

#[derive(Serialize)]
pub struct UczenWKlasieResponse {
    pub id_ucznia: i32,
    pub imie: Option<String>,     
    pub nazwisko: Option<String>, 
}

#[get("/nauczyciel/klasy/<id_klasy>/uczniowie")]
pub async fn nauczyciel_uczniowie_w_klasie(
    id_klasy: i32,
    conn: &State<PgPool>
) -> Result<Json<Vec<UczenWKlasieResponse>>, Status> {
    let uczniowie = sqlx::query_as!(
        UczenWKlasieResponse,
        r#"
        SELECT id_ucznia, imie, nazwisko 
        FROM Uczniowie 
        WHERE id_klasy = $1 
        ORDER BY nazwisko, imie
        "#,
        id_klasy
    )
    .fetch_all(conn.inner())
    .await;

    match uczniowie {
        Ok(u) => Ok(Json(u)),
        Err(_) => Err(Status::InternalServerError),
    }
}

// ==========================================
// 2. UCZEŃ
// ==========================================

#[derive(Serialize)]
pub struct UczenOcenyPoPrzedmiotach {
    pub nazwa_przedmiotu: String,
    pub oceny: Vec<SzczegolyOceny>,
}

#[derive(Serialize)]
pub struct SzczegolyOceny {
    pub wartosc: f32,
    pub nazwa_typu: String,
    pub waga: i32,
    pub data_wystawienia: Option<chrono::NaiveDate>, 
}

#[get("/uczen/oceny/<id_ucznia>")]
pub async fn uczen_lista_ocen(
    id_ucznia: i32,
    conn: &State<PgPool>
) -> Result<Json<Vec<UczenOcenyPoPrzedmiotach>>, Status> {
    let rows = sqlx::query!(
        r#"
        SELECT 
            p.nazwa as nazwa_przedmiotu,
            o.ocena as "wartosc: f32",
            t.nazwa_oceny as nazwa_typu,
            t.waga,
            o.id_oceny 
        FROM Oceny o
        JOIN Przedmioty p ON o.id_przedmiotu = p.id_przedmiotu
        JOIN Typy_Ocen t ON o.id_typu_oceny = t.id_typu_oceny
        WHERE o.id_ucznia = $1
        ORDER BY p.nazwa
        "#,
        id_ucznia
    )
    .fetch_all(conn.inner())
    .await;

    match rows {
        Ok(data) => {
            let mut mapa: HashMap<String, Vec<SzczegolyOceny>> = HashMap::new();

            for row in data {
                let szczegoly = SzczegolyOceny {
                    wartosc: row.wartosc,
                    nazwa_typu: row.nazwa_typu,
                    waga: row.waga,
                    data_wystawienia: None, 
                };
                mapa.entry(row.nazwa_przedmiotu).or_default().push(szczegoly);
            }

            let wynik = mapa.into_iter()
                .map(|(nazwa, oceny)| UczenOcenyPoPrzedmiotach { nazwa_przedmiotu: nazwa, oceny })
                .collect();

            Ok(Json(wynik))
        },
        Err(_) => Err(Status::InternalServerError),
    }
}

// ==========================================
// 3. ADMIN
// ==========================================

#[derive(Serialize)]
pub struct AdminUzytkownikZRolemResponse {
    pub imie: Option<String>,
    pub nazwisko: Option<String>,
    pub login: Option<String>,
    pub rola: Option<String>,
}

#[get("/admin/uzytkownicy")]
pub async fn admin_lista_uzytkownikow(conn: &State<PgPool>) -> Result<Json<Vec<AdminUzytkownikZRolemResponse>>, Status> {
    let uzytkownicy = sqlx::query_as!(
        AdminUzytkownikZRolemResponse,
        r#"
        SELECT 
            COALESCE(u.imie, n.imie) as imie, 
            COALESCE(u.nazwisko, n.nazwisko) as nazwisko, 
            k.login, 
            k.rola 
        FROM Konta_Uzytkownikow k
        LEFT JOIN Uczniowie u ON k.login = u.login
        LEFT JOIN Nauczyciele n ON k.login = n.login
        "#
    )
    .fetch_all(conn.inner())
    .await;

    match uzytkownicy {
        Ok(u) => Ok(Json(u)),
        Err(_) => Err(Status::InternalServerError),
    }
}

#[derive(Deserialize)]
pub struct NowyUzytkownikRequest {
    pub login: String,
    pub haslo_jawne: String,
    pub rola: String, 
}

#[post("/admin/uzytkownicy", data = "<req>")]
pub async fn admin_dodaj_uzytkownika(
    req: Json<NowyUzytkownikRequest>,
    conn: &State<PgPool>,
) -> Result<Status, Status> {
    
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    let hash_hasla = match argon2.hash_password(req.haslo_jawne.as_bytes(), &salt) {
        Ok(hash) => hash.to_string(),
        Err(_) => return Err(Status::InternalServerError),
    };

    let result = sqlx::query!(
        "INSERT INTO Konta_Uzytkownikow (login, haslo_hash, rola) 
         VALUES ($1, $2, $3)",
        req.login,
        hash_hasla,
        req.rola
    )
    .execute(conn.inner())
    .await;

    match result {
        Ok(_) => Ok(Status::Created), 
        Err(sqlx::Error::Database(db_err)) if db_err.is_unique_violation() => {
            Err(Status::Conflict) 
        }
        Err(_) => Err(Status::InternalServerError),
    }
}

#[delete("/admin/uzytkownicy/<login>")]
pub async fn admin_usun_uzytkownika(
    login: String,
    conn: &State<PgPool>,
) -> Result<Status, Status> {
    
    let result = sqlx::query!(
        "DELETE FROM Konta_Uzytkownikow WHERE login = $1",
        login
    )
    .execute(conn.inner())
    .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => Ok(Status::NoContent), 
        Ok(_) => Err(Status::NotFound), 
        Err(_) => Err(Status::InternalServerError),
    }
}
