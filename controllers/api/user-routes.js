const router = require('express').Router();
const { response } = require('express');
const { User, Post, Comment } = require('../../models');


      // get all users
      router.get('/', (req, res) => {
        User.findAll({
            include: {
              model: Post,
            }
        })
          .then(dbUserData => res.json(dbUserData))
          .catch(err => {
            console.log(err);
            res.status(500).json(err);
          });
      });
      
      router.get('/:id', (req, res) => {
        User.findOne({
          
          where: {
            id: req.params.id
          },
          include: [
            {
              model: Post,
              attributes: ['id', 'title', 'created_at']
            },
            {
              model: Comment,
              attributes: ['id', 'comment_text', 'created_at'],
              include: {
                model: Post,
                attributes: ['title']
              }
            },
          ]
        })
          .then(dbUserData => {
            if (!dbUserData) {
              res.status(404).json({ message: 'No user found with this id' });
              return;
            }
            res.json(dbUserData);
          })
          .catch(err => {
            console.log(err);
            res.status(500).json(err);
          });
      });
      
      router.post('/', (req, res) => {
    // expects username and password
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          .then(dbUserData => {
            req.session.save(() => {
              req.session.user_id = dbUserData.id;
              req.session.username = dbUserData.username;
              req.session.loggedIn = true;
      
              res.json(dbUserData);
              res.render('/');
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json(err);
          });
      });
      

      //route to log user in
      router.post('/login', (req, res) => {
        // expects username and password}
        User.findOne({
          where: {
            username: req.body.username,
          
          }
        }).then(dbUserData => {
          if (!dbUserData) {
            res.status(400).json({ message: 'No user with that username!' });
            return;
          }
      
          const validPassword = dbUserData.checkPassword(req.body.password);
      
          if (!validPassword) {
            res.status(400).json({ message: 'Incorrect password!' });
            return;
          }
      
          req.session.save(() => {
            req.session.user_id = dbUserData.id;
            req.session.username = dbUserData.username;
            req.session.loggedIn = true;
            
      console.log("logged in");
            res.json({ user: dbUserData, message: 'You are now logged in!' });
            
          });
        });
      });
      //route to log user out
      router.post('/logout', (req, res) => {
       if(req.session.loggedIn){
          req.session.destroy(() => {
            res.status(204).end();
          });
        }
        else {
          res.status(404).end();
        }
      });

     
      
     
      



module.exports = router;
