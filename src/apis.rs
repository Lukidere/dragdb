use rocket::serde::json::Json;
use rocket::serde::{Deserialize, Serialize};
use rocket::{State, http::Status};
use sqlx::PgPool;

// ==========================================
// B) NAUCZYCIEL
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

// Handler dodawania ocen pozostaje bez zmian (INSERT)
// Handler edycji (UPDATE) został usunięty zgodnie z instrukcją.

// ==========================================
// C) UCZEŃ - Oceny pogrupowane po przedmiotach
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
    
    // Zapytanie pobierające wszystkie oceny ucznia wraz z nazwami przedmiotów i typami
    let rows = sqlx::query!(
        r#"
        SELECT 
            p.nazwa as nazwa_przedmiotu,
            o.ocena as "wartosc: f32",
            t.nazwa_oceny as nazwa_typu,
            t.waga,
            o.id_oceny -- zakładamy, że data może być wyciągnięta z ID lub kolumny
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
            // Grupowanie w pamięci Rusta (dla uproszczenia przykładu)
            use std::collections::HashMap;
            let mut mapa: HashMap<String, Vec<SzczegolyOceny>> = HashMap::new();

            for row in data {
                let szczegoly = SzczegolyOceny {
                    wartosc: row.wartosc,
                    nazwa_typu: row.nazwa_typu,
                    waga: row.waga,
                    data_wystawienia: None, // Dodaj kolumnę daty do tabeli Oceny, jeśli jej brak
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
// D) ADMIN - Lista użytkowników z rolami
// ==========================================

#[derive(Serialize)]
pub struct AdminUzytkownikZRolemResponse {
    pub imie: Option<String>,
    pub nazwisko: Option<String>,
    pub login: String,
    pub rola: String,
}

#[get("/admin/uzytkownicy")]
pub async fn admin_lista_uzytkownikow(conn: &State<PgPool>) -> Result<Json<Vec<AdminUzytkownikZRolemResponse>>, Status> {
    // Łączymy tabelę kont z tabelami profilowymi, aby wyciągnąć imiona i nazwiska
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
