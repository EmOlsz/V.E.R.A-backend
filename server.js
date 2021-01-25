import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import moment from 'moment';

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/vera";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(bodyParser.json());

// MODELS

const Feeding = new mongoose.model('Feeding', {
  breast: String,
  timer: Number,
  date: {
    type: Date,
    default: () => new Date()
  }
});

const Quote = new mongoose.model('Quote', {
  value: String
});

// FEEDING

app.post('/feeding', async (req,res) => {
  const newFeeding = new Feeding(req.body);
  await newFeeding.save();
  res.json(newFeeding);
});

app.get('/feeding/daily/:breast', async (req, res) => {
  const { breast } = req.params;
  const today = moment().startOf('day');

  const feedingList = await Feeding.find({
    breast,
    date: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate()
    }
  });

  res.json(feedingList);
});

// QUOTES

app.post('/quotes', async (req, res) => {
  const newQuote = new Quote(req.body);
  await newQuote.save();

  res.json(newQuote);
});


app.get('/quotes', async (req, res) => {
  const quoteList = await Quote.find();
  const randomQuote = quoteList[Math.floor(Math.random() * (quoteList.length + 1))];

  res.json(randomQuote);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
