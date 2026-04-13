use rocket::fs::{FileServer,relative};
mod apis;
use apis::*;
use sqlx::{PgConnection, PgPool, postgres::PgConnectOptions};


#[macro_use] extern crate rocket;




#[launch]
async fn rocket() -> _ {
    rocket::build()
        .manage(connect_to_postgres().await.unwrap())
        .mount("/", routes![
            nauczyciel_lista_przedmiotow,
            nauczyciel_dodaj_ocene,
            nauczyciel_lista_klas,
            nauczyciel_uczniowie_w_klasie,
            uczen_lista_ocen,
            admin_lista_uzytkownikow,
            admin_dodaj_uzytkownika,
            admin_usun_uzytkownika
            login_handler
        ])
        .mount("/",FileServer::from(relative!("src/frontend/student_journal/dist/")))
}


async fn connect_to_postgres() -> Result<sqlx::PgPool,sqlx::Error>{
    PgPool::connect("postgres://uzytkownik:haslo@100.122.0.82:5432/szkola").await
    
}

#[cfg(test)]
mod tests {
    use super::*;
    #[tokio::test]
    pub async fn try_connect_to_psql() {
        let rslt = connect_to_postgres().await;
        match rslt {
            Ok(_) => (),
            Err(ref e) => eprintln!("ERROR ERROR!: {}",e)
        }
        assert!(rslt.is_ok())
    }

}

