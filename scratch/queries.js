'use strict';

const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

//GET ALL BY SEARCH
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const searchTerm = 'lady gaga';
    let filter = {};

    if (searchTerm) {
      const re = new RegExp(searchTerm, 'i');
      filter.title = { $regex: re };
    }

    return Note.find(filter)
      .sort('created')
      .then(results => {
        console.log(results);
      })
      .catch(console.error);
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

//GET ONE BY ID
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const id = '000000000000000000000001';

    return Note.findById(id)
      .then(result => {
        console.log(result);
      })
      .catch(console.error);
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

//CREATE
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const newData = {
      title: 'New Title',
      content: 'New Content'
    };

    if (!newData.title) {
      const err = new Error('Missing `title` in request body');
      console.error(err);
      // err.status = 400;
      // return next(err);
    }

    return Note.create(newData)
      .then(result => {
        console.log(result);
      })
      .catch(console.error);
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

//UPDATE BY ID
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const id = '000000000000000000000001';
    const updatedData = {
      title: 'Updated Title',
      content: 'Updated Content'
    };

    if (!updatedData.title) {
      const err = new Error('Missing `title` in request body.');
      console.error(err);
    }

    return Note.findByIdAndUpdate(id, updatedData, { new: true })
      .then(result => {
        console.log(result);
      })
      .catch(console.error);
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

//DELETE
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const id = '000000000000000000000001';

    return Note.findByIdAndRemove(id)
      .then(() => {
        console.log('Deleted');
      })
      .catch(console.error);
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
