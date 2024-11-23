const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require("axios");
require('dotenv').config();

const stripe_key = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(stripe_key);


const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/test", (Req, res) => {
    res.send("frontend is working!!!")
})
app.get("/about", (req, res) => {
    try {
        res.render("about")

    }catch(error) {
        console.log("error occurred getting about page: ", error)
    }

});
app.get("/FAQS", (req, res) => {
    try {
        res.render("faq")

    }catch(error) {
        console.log("error occurred getting FAQ page: ", error)
    }

}); 
app.get('/', async(req, res) => {
    try {
        const all_posts = await axios.get("http://34.201.173.137:5001/");
        //console.log(all_posts.data);
        //

        res.render('index', {posts: all_posts.data});
        //res.render('index', {posts: []});



    }catch(error) {
        console.error('Error fetching all post data: ', error)

    }
});

app.get('/view-post', async (req, res) => {
    try{
        const { post_id } = req.query;
        //console.log('post_id: ', post_id);
        const post_details = await axios.get('http://34.201.173.137:5001/post-details', {
            params: {
                post_id: post_id
            }
        })
        //console.log(post_details)
        res.render('post', {post_details: post_details})
    

    }catch(error){
        console.log('error fetching view post: ', error)
    }
});


app.get('/get-submission-info', (req, res) => {


});
app.get('/stripe', async(req, res) => {

    //const total = parseInt(req.body.price) * parseInt(req.body.quantity) ;
    //const submission_details = await axios.get('http://localhost:3000/get-submission-info');
    let total = 49;

    const { report_type, videoUpload } = req.query;
    //console.log("report type is: ", report_type)

    if (videoUpload == 'yes') {
        total += 29;
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 100,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true
        }
    })
    res.render('stripe', {client_secret: paymentIntent.client_secret})


    //res.render('stripe');
})


//pay to vote
app.get('/pay-to-vote-stripe', async(req, res) => {

    //const total = parseInt(req.body.price) * parseInt(req.body.quantity) ;
    const total = 49
    const paymentIntent = await stripe.paymentIntents.create({
        amount: total * 0.01,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true
        }
    })
    res.render('stripe', {client_secret: paymentIntent.client_secret})


    //res.render('stripe');
})


app.get('/confirm-payment', (req, res) => {
    res.render('confirmation');
});

const storage = multer.memoryStorage(); // or configure for file storage
const upload = multer({ storage: storage });

app.post('/create-post', upload.single('media'), (req, res) => {
console.log('create-post-endpoint: ', req.body);
const fileData = req.file;
console.log('fileData: ', fileData);
    res.json({
        message: 'Form data received successfully',
        data: req.body
    })

})

app.get("/search/:query", (req, res) => {
    const query = req.params.query;
    console.log("query is: ", query);
    res.status(200).send("query is sent");
});
app.listen(port, () => {
    console.log('up on 3000')
})