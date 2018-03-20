'use strict';

const express = require('express');
// Create an router instance (aka "mini-app")
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/notes', (req, res, next) => {
  // mongoose
  //   .connect(MONGODB_URI)
  //   .then(() => {
  //     const searchTerm = req.query.searchTerm;
  //     let filter = {};

  //     if (searchTerm) {
  //       const re = new RegExp(searchTerm, 'i');
  //       filter.title = { $regex: re };
  //     }

  //     return Note.find(filter)
  //       .sort('created')
  //       .then(results => {
  //         res.json(results);
  //       })
  //       .catch(next);
  //   })
  //   .then(() => {
  //     return mongoose.disconnect().then(() => {
  //       console.info('Disconnected');
  //     });
  //   })
  //   .catch(err => {
  //     console.error(`ERROR: ${err.message}`);
  //     console.error(err);
  //   });

  mongoose
    .connect(MONGODB_URI)
    .then(() => Note.createIndexes())
    .then(() => {
      const searchTerm = req.query.searchTerm;

      let filter = {};

      if (searchTerm) {
        filter.$text = { $search: searchTerm };
      }

      return Note.find(
        filter,
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } })
        .then(results => {
          res.json(results);
        })
        .catch(next);
    })
    .then(() => {
      return mongoose.disconnect().then(() => {
        console.info('Disconnected');
      });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });


});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/notes/:id', (req, res, next) => {
  // console.log('Get a Note');
  // res.json({ id: 2 });

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;
      console.log(id);

      return Note.findById(id)
        .then(result => {
          res.json(result);
        })
        .catch(next);
    })
    .then(() => {
      return mongoose.disconnect().then(() => {
        console.info('Disconnected');
      });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/notes', (req, res, next) => {

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const newData = {
        title: req.body.title,
        content: req.body.content
      };

      return Note.create(newData)
        .then(result => {
          res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
        })
        .catch(next);
    })
    .then(() => {
      return mongoose.disconnect().then(() => {
        console.info('Disconnected');
      });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;
      const updatedData = {
        title: req.body.title,
        content: req.body.content
      };

      if (!updatedData.title) {
        const err = new Error('Missing `title` in request body.');
        console.error(err);
      }

      return Note.findByIdAndUpdate(id, updatedData, { new: true })
        .then(result => {
          res.json(result).status(200);
        })
        .catch(next);
    })
    .then(() => {
      return mongoose.disconnect().then(() => {
        console.info('Disconnected');
      });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {

  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      const id = req.params.id;

      return Note.findByIdAndRemove(id)
        .then(() => {
          res.status(204).end();
        })
        .catch(next);
    })
    .then(() => {
      return mongoose.disconnect().then(() => {
        console.info('Disconnected');
      });
    })
    .catch(err => {
      console.error(`ERROR: ${err.message}`);
      console.error(err);
    });

});

module.exports = router;
