
const express = require('express');
const app = express();
const port = 3000;
const request = require('request');


const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require('./Key.json');
const { default: axios } = require('axios');

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    res.render('start');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/signupsubmit', (req, res) => {
    const full_name = req.query.first_name;
    const last_name = req.query.last_name;
    const email = req.query.email;
    const password = req.query.psw;
    const rep_psw = req.query.psw_repeat;

    if (password === rep_psw) {
        db.collection('users')
            .add({
                name: full_name + ' ' + last_name,
                email: email,
                password: password,
            })
            .then(() => {
                res.render('signin');
            })
            .catch((error) => {
                console.error('Error adding user:', error);
                res.send('Error adding user');
            });
    } else {
        res.send('SignUP Failed');
    }
});

app.get('/signin', (req, res) => {
    res.render('signin');
});

app.get('/signinsubmit', (req, res) => {
    const email = req.query.email;
    const password = req.query.password;

    db.collection('users')
        .where('email', '==', email)
        .where('password', '==', password)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                let usersData = [];
                docs.forEach((doc) => {
                    usersData.push(doc.data());
                });
                res.render('home', { userData: usersData });
            } else {
                res.send('Login Failed');
            }
        })
        .catch((error) => {
            console.error('Error getting user:', error);
            res.send('Error getting user');
        });
});

app.get('/end', (req, res) => {
    res.render('end');
});





app.get('/', (req, res) => {
    res.render('welcome', { userData, countryData: null, error: null });
});

app.post('/search', async (req, res) => {
    const countryName = req.body.countryName;
    console.log(`Searching for country: ${countryName}`);
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
        const countryData = response.data[0]; // Get the first result
        console.log('Country data found:', countryData);
        res.render('welcome', { userData, countryData, error: null });
    } catch (error) {
        console.error('Error fetching country data:', error);
        res.render('welcome', { userData, countryData: null, error: 'Country not found' });
    }
});






app.listen(port, () => {
    console.log(`Your app is running on http://localhost:${port}`);
    
});
