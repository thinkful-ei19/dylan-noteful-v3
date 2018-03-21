const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Notes Tests', function () {
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI);
  });

  beforeEach(function () {
    return Note.insertMany(seedNotes)
      .then(() => Note.createIndexes());
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });

  //GET ALL
  describe('GET /api/notes', function () {
    it('should return the correct number of Notes', function () {
      const dbPromise = Note.find();
      const apiPromise = chai.request(app).get('/api/notes');
      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });
    });

    it('should return an empty array for an incorrect search', function () {

      const searchTerm = 'This will not be a valid search';
      const dbPromise = Note.find({ title: searchTerm });
      const apiPromise = chai.request(app).get(`/api/notes?searchTerm=${searchTerm}`);

      return Promise.all([dbPromise, apiPromise])
        .then(([data, res]) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(data.length);
        });

    });

  });

  //GET ONE
  describe('GET /api/notes/:id', function () {
    it('should return correct notes', function () {
      let data;
      return Note.findOne().select('id title content')
        .then(_data => {
          data = _data;
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'created');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
        });
    });

    it('should respond with a 404 for invalid id', function () {

      return chai.request(app)
        .get('/api/notes/DDDDDDDDDDDDDDDDDDDDDDDD')
        .catch(err => err.response)
        .catch(res => {
          expect(res).to.have.status(404);
        });

    });

  });

  //CREATE ONE
  describe('POST /api/notes', function () {
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content');
          return Note.findById(body.id);
        })
        .then(data => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });

    it('should return an error when the title is missing', function () {

      const newItem = {
        content: 'content without a title'
      };

      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
        });
    });

  });

  describe('PUT /api/notes/:id', function () {

    it('should update a note from an id', function () {

      const updateData = {
        title: 'New title',
        content: 'New content'
      };

      let data;
      return Note.findOne()
        .then(_data => {
          data = _data;
          return chai.request(app)
            .put(`/api/notes/${data.id}`)
            .send(updateData);
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'content');

          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(updateData.title);
          expect(res.body.content).to.equal(updateData.content);
        });

    });

    it('should respond with a 404 error for invalid id', function () {

      const updateData = {
        title: 'New title',
        content: 'New content'
      };

      return chai.request(app)
        .put('/api/notes/DDDDDDDDDDDDDDDDDDDDDDDD')
        .send(updateData)
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });

    });

  });

  describe('DELETE /api/notes/:id', function () {

    it('should delete a note from a given id', function () {

      return Note.findOne()
        .then(data => {
          return chai.request(app).delete(`/api/notes/${data.id}`);
        })
        .then(function (res) {
          expect(res).to.have.status(204);
        });
    });

    it('should respond with a 404 for an invalid id', function () {

      return chai.request(app)
        .delete('/api/notes/AAAAAAAAAAAAAAAAAAAAAAAA')
        .catch(err => err.response)
        .then(res => {
          console.log(res.status);
          expect(res).to.have.status(404);
        });
    });

  });

});