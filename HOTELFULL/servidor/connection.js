const  Connection= require('tedious').Connection;

//para hacer las consultas 
const Request=require('tedious').Request;

const config = {
    server: "Julieta\\SQLEXPR   ESS",
    authentication: {
        type: 'default',
        options: {
            userName: "serverdejuli",
            password: "22637758Jj"
        }
    },
    options: {
        port: 1433,
        database: 'HotelParaiso',
        trustServerCertificate: true,
    }
}
const connection= new Connection(config);
connection.connect();
connection.on('connect', (err) => {
    if (err) {
        console.error('❌ Error conectando a SQL Server');
        throw err;
    }
    console.log('✅ Conectado a SQL Server');
    executeStatment();
});

function executeStatment() {
    const request = new Request(`
        SELECT COUNT(*) as existe 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'USUARIOS'
    `, (err, rowCount) => {
        if (err) {
            throw err;
        }
        connection.close();
    });

    request.on('row', (columns) => {
        const existe = columns[0].value > 0;
        if (existe) {
            console.log('La tabla USUARIO EXISTE');
        } else {
            console.log('La tabla USUARIO NO EXISTE');
        }
    });

    connection.execSql(request);
}