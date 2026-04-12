use rocket::fs::FileServer;
mod apis;
use apis::*;
use sqlx::{PgConnection, PgPool, postgres::PgConnectOptions};


#[macro_use] extern crate rocket;




#[launch]
async fn rocket() -> _ {
    rocket::build()
        .manage(connect_to_postgres().await.unwrap())
        .mount("/api",routes![get_klasa_data,get_single_uczen_data])
        .mount("/",FileServer::from("static"))
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

