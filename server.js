const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
//Load env vars
dotenv.config({ path: './config/config.env' });

//Connect to dataase
connectDB();

//Route files
const massageshops = require('./routes/massageshops');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations ');
const users = require('./routes/users');

const app = express();
app.use(cors());

//Body parser
app.use(express.json());

//Set security headers
// app.use(helmet());

//Sanitize data
app.use(mongoSanitize());

//Prevent XSS attacks
app.use(xss());

//Cookie parser
app.use(cookieParser());

//Rate Limiting
const limiter = rateLimit({
    windowsMs: 10 * 60 * 1000,//10 mins
    max: 100
});
app.use(limiter);

//Prevent param pollution
app.use(hpp());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5003/api/v1'
            }
        ]
    },
    apis: ['./routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/api/v1/massageshops', massageshops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use('/api/v1/users', users);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error : ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
})