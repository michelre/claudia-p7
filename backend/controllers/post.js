const Post = require('../models/post');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const async = require('async');
const models = require('../models');


exports.createPost = (req, res, next) => {
  console.log('début backend');
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  const userId = decodedToken.userId;
  console.log('userId' + userId);
  // models.User.findById(userId)
  // const postObject = req.body;
  // delete postObject.id;
  const post = new models.Post({
    title: req.body.title,
    contentPost: req.body.contentPost,
    // attachment: req.body.attachment,
    attachment: req.file ? req.file.filename : null,
    likes: 0,
    userId: userId
    // imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log(req)
  console.log(post)
  post.save()
    .then(() => res.status(201).json({ message: 'Post enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};


exports.modifyPost = (req, res, next) => {
  const postId = req.params.id;
  console.log('postId = '+ postId);
  console.log('req.body.post = '+ req.body.post);
  const postObject = req.file ?
    {
      ...JSON.parse(req.body.post),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  console.log(postObject);
  models.Post.update({ title: postObject.title, contentPost: postObject.contentPost }, {where : {id: postId}})
    .then(() => res.status(200).json({ message: 'Post modifié !'}))
    .catch(error => res.status(400).json({ error }));
};


exports.deletePost = (req, res, next) => {
  console.log('début backend deletePost')
  models.Post.findOne({ where:{ id: req.params.id }})
    .then(post => {
      // const filename = post.imageUrl.split('/images/')[1];
      // fs.unlink(`images/${filename}`, () => {
        models.Post.destroy({ where:{ id: req.params.id }})
          .then(() => res.status(200).json({ message: 'Post supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      // });
    })
    .catch(error => res.status(500).json({ error }));
};


exports.getAllPosts = (req, res, next) => {
  // console.log('get all posts backend');
  // const postList = 
  models.Post.findAll({order: [['updatedAt', 'DESC']]})
    .then((posts) => {
      // console.log('-----------------------------valeur de posts apres findAll---------------------------');
      // console.log(posts);
      // console.log('-----------------------------Avant boucle for---------------------------');
        for (let i = 0; i < posts.length; i++){
          const userId = posts[i].userId;
          models.User.findOne({ where: { id: userId } }).then(
            (user) => {
              
              // console.log('-----------valeur du user avec le userId=' + userId + ' pour le post n° ' + i);
              // console.log(user);

            if (userId != null) {
              const firstname = user.firstname;
              const lastname = user.lastname;
              // console.log(firstname);
              // console.log(lastname);
              posts[i].dataValues.authorFirstName = firstname;
              posts[i].dataValues.authorLastName = lastname;
              posts[i].dataValues.userAlreadyLiked = false;
              // return res.status(404).send(new Error('User not found!'));
            } else {
              posts[i].dataValues.authorFirstName = 'M./Mme';
              posts[i].dataValues.authorLastName = 'Anonyme';
            }
                // Verification de l'association like 
                // /!\ /!\ désactivé car la table Like n'existe pas encore
                // models.Like.findOne({ where: { userId: userId, postId: postId} })
                models.Post.findOne({ where: { id: 4712132} }) // /!\ fausse instruction pour garder la structure '.then(...)' sans qu'il y ait d'erreur à cause de l'absence de la table Like --> a supprimer plus tard
                .then(foundLike => {
                  if (!foundLike){
                    posts[i].dataValues.userAlreadyLiked = false;
                  } else {
                    posts[i].dataValues.userAlreadyLiked = true;
                  }

                    // console.log('anonyme');
                  
                  // console.log('-----------valeur du post ' + i + ' apres ajout du nom / prenom');
                  // console.log(posts[i]);
                  if (i == posts.length-1)
                  {
                    // console.log('-----------------------------fin de la boucle for---------------------------');
                    // console.log(posts);
                    // console.log('-----------------------------apres posts, juste avant renvoi de posts vers le frontend----------------------------');
                    res.status(200).json(posts);
                  }
                })
          })
          .catch(
            () => {
            res.status(500).send(new Error('Database error!'));
          })
        }
    })
    .catch((error) => {
      console.log('erreur catch final')
      res.status(400).json({error: error});
    });
};


//ça marche pas parfait mais ça marche
// exports.getAllPosts = (req, res, next) => {
//   // console.log('get all posts backend');
//   // const postList = 
//   models.Post.findAll({order: [['updatedAt', 'DESC']]})
//     .then((posts) => {
//       // console.log('-----------------------------valeur de posts apres findAll---------------------------');
//       // console.log(posts);
//       // console.log('-----------------------------Avant boucle for---------------------------');
//         for (let i = 0; i < posts.length; i++){
//           const userId = posts[i].userId;
//           models.User.findOne({ where: { id: userId } }).then(
//             (user) => {
//               // console.log('-----------valeur du user avec le userId=' + userId + ' pour le post n° ' + i);
//               // console.log(user);

//             if (userId != null) {
//               const firstname = user.firstname;
//               const lastname = user.lastname;
//               // console.log(firstname);
//               // console.log(lastname);
//               posts[i].dataValues.authorFirstName = firstname;
//               posts[i].dataValues.authorLastName = lastname;
//               // return res.status(404).send(new Error('User not found!'));
//             } else {
//               posts[i].dataValues.authorFirstName = 'M./Mme';
//               posts[i].dataValues.authorLastName = 'Anonyme';
//               // console.log('anonyme');
//             }
//             // console.log('-----------valeur du post ' + i + ' apres ajout du nom / prenom');
//             // console.log(posts[i]);
//             if (i == posts.length-1)
//             {
//               // console.log('-----------------------------fin de la boucle for---------------------------');
//               // console.log(posts);
//               // console.log('-----------------------------apres posts, juste avant renvoi de posts vers le frontend----------------------------');
//               res.status(200).json(posts);
//             }
//           } 
//           ).catch(
//             () => {
//             res.status(500).send(new Error('Database error!'));
//           })
//         }
//     })
//     .catch((error) => {
//       console.log('erreur catch final')
//       res.status(400).json({error: error});
//     });
// };


// ORIGINAL
// exports.getAllPosts = (req, res, next) => {
//   console.log('get all posts backend')
//   models.Post.findAll()
//   .then((posts) => {res.status(200).json(posts);})
//   .catch((error) => {res.status(400).json({error: error});
//     });
// };

exports.getOnePost = (req, res, next) => {
  const postId = parseInt(req.params.id)
  // console.log('dans get ONE POST')
  // console.log(postId)
  models.Post.findByPk(postId)
    .then((post) => {
      // console.log(post)
      return res.status(200).json(post);
    })
    .catch((error) => {return res.status(404).json({error: error});
    });
};


exports.likePost = (req, res, next) => {
  console.log('début like post')

  // récupération de l'Id de l'utilisateur
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
  const userId = decodedToken.userId;
  console.log('userId = ' + userId)

  // récupération de l'Id du post
  const postId = req.params.id;
  console.log('postId = ' + postId)

  // Verification de l'association like 
  // /!\ /!\ désactivé car la table Like n'existe pas encore
  // models.Like.findOne({ where: { userId: userId, postId: postId} })
  models.Post.findOne({ where: { id: 4343414} }) // /!\ fausse instruction pour garder la structure '.then(...)' sans qu'il y ait d'erreur à cause de l'absence de la table Like --> a supprimer plus tard
  .then(foundLike => {
    console.log('foundLike');
    console.log(foundLike);

    if(!foundLike){ // si l'utilisateur n'a pas liké le post
    
    console.log('creation de l"association entre le post et l"utilisateur ');
    // /!\ /!\ désactivé car la table Like n'existe pas encore
    // new models.Like({ // creation de l'association entre le post et l'utilisateur dans la table de Like
    //     userId: userId,
    //     postId: postId
    //   })
      models.Post.findOne({ where: { id: 4343414} }) // /!\ fausse instruction pour garder la structure '.then(...)' sans qu'il y ait d'erreur à cause de l'absence de la table Like --> a supprimer plus tard
      .then(association => {
        console.log('association');
        console.log(association);

        models.Post.findOne({ where: { id: postId} }) // recherche du post a liker
        .then(currentPost => {

          console.log('avant increment');
          currentPost.increment('likes', { by: 1 }); // increment du nombre de likes pour le post
          console.log('apres increment');

          res.status(201).json({ message: 'Post liké !'})
        })
      })

    }else{ //si l'utilisateur a deja liké ce post

      // on detruit le lien entre le post et l'utilisateur dans la table Like
      console.log('on detruit le lien entre le post et l"utilisateur dans la table Like');
          // /!\ /!\ désactivé car la table Like n'existe pas encore
      // models.Like.destroy({ where: { userId: userId, postId: postId} })
      models.Post.findOne({ where: { id: 4343414} }) // /!\ fausse instruction pour garder la structure '.then(...)' sans qu'il y ait d'erreur à cause de l'absence de la table Like --> a supprimer plus tard
      .then( () => {

        console.log('recherche du post ou enlever like');
        models.Post.findOne({ where: { id: postId} }) // recherche du post ou enlever like
        .then(currentPost => {

          console.log('avant décrément');
          currentPost.decrement('likes', { by: 1 });
          console.log('apres décrément');

          res.status(201).json({ message: 'Like supprimé'})
        })
      })
    } //fin du if/else
  })
  .catch(error => res.status(400).json({ error }));
};

// ---- Brouillon ----
   //   models.Post.update({likes: postId.likes + 1})
//   currentPost = await models.Post.findOne({ where: { id: postId} })
//   const incrementResult = await currentPost.increment('likes', { by: 1 });
//   .then(() => res.status(201).json({ message: 'resultat: ' + incrementResult + ' Post liké !'}))
//   .catch(error => res.status(400).json({ error }));

//   recherche d'un like précédent parl'utilisateur
//   models.Like.findOne({
//     where: {
//         userId: userId,
//         messageId: messageId
//     }
// })

// models.User.findOne({ where: { id: currentUserId} })
    //   .then(currentUser => {
      //     console.log(currentPost);
      //     console.log(currentUser);
      //   //= sequelize.define('Actor', { name: DataTypes.STRING });
      //     currentPost.belongsToMany(currentUser, { through: 'Likes' });
      //     currentUser.belongsToMany(currentPost, { through: 'Likes' });
      //     console.log('done');
          // res.status(201).json({ message: 'Post liké !'})
      // }) 
      

  // models.Post.findOne({ where: { id: postId} })
  //   .then(post => {


  //     // const usersLiked = [];
  //     // if(!(post.likes.includes(currentUserId))){ 
  //     //   models.Post.likes.append(currentUserId)
  //     //     .then(() => res.status(201).json({ message: 'Post liké !'}))
  //     //     .catch(error => res.status(400).json({ error }));
  //     // } else { // si l'utilisatuer annule son avis
  //     //   models.Post.likes.destroy(currentUserId)
      
  //     //     .then(() => res.status(201).json({ message: 'like annulé !'}))
  //     //     .catch(error => res.status(400).json({ error }));   
  //     // }
  //   })
   
  
 
  // .then(() => res.status(201).json({ message: 'Post liké !'}))


//ORIGINAL
// exports.likePost = (req, res, next) => {
//   const like = req.body.like;
//   const currentUserId = req.body.userId;
//   const postId = req.params.id;
//   models.Post.findOne({ id: postId })
//     .then(post => {
//       if(!(post.usersLiked.includes(currentUserId) || sauce.usersDisliked.includes(currentUserId))){ // si l'utilisateur n'a pas encore donné son avis: l'id de l'utilisateur n'existe pas dans la liste usersLiked ou usersDisliked de la sauce
//         if(like == 1){ // si il aime la sauce
//           Post.updateOne({ id: postId }, { 
//             $inc: { likes: 1 }, // incrementer la valeur de likes
//             $addToSet: { usersLiked: currentUserId }, // ajouter son userId dans la liste de usersLiked
//           })
//           .then(() => res.status(201).json({ message: 'Post liké !'}))
//           .catch(error => res.status(400).json({ error }));
//         }
//         else if(like == -1){ // s'il aime pas le post
//           models.Post.updateOne({ id: postId }, {
//             $inc: { dislikes: 1 }, // incrementer la valeur de dislikes
//             $addToSet: { usersDisliked: currentUserId }, // ajouter son userId dans la liste de usersDisliked
//           })
//           .then(() => res.status(201).json({ message: 'Like annulé !'}))
//           .catch(error => res.status(400).json({ error }));
//         }
//       } else if(like == 0) { // si l'utilisatuer annule son avis
//         if(post.usersLiked.includes(currentUserId)){ // si l'avis précédent était positif
//           models.Post.updateOne({ _id: postId }, {
//             $inc: { likes: -1 }, // la valeur de likes est disminuée d'1
//             $pull: { usersLiked: currentUserId }, // et on efface son userId de la liste de usersLiked
//           })
//           .then(() => res.status(201).json({ message: 'like annulé !'}))
//           .catch(error => res.status(400).json({ error }));   
//         }
//         if(post.usersDisliked.includes(currentUserId)){ // si l'avis précédent était négatif
//           models.Post.updateOne({ id: postId }, {
//             $inc: { dislikes: -1 }, /// la valeur de dislikes est disminuée d'1
//             $pull: { usersDisliked: currentUserId }, // et on efface son userId de la liste de usersDisliked
//           })
//           .then(() => res.status(201).json({ message: 'Non like annulé !'}))
//           .catch(error => res.status(400).json({ error }));   
//         }
//       } 
//     })
//     .catch(error => res.status(400).json({ error }));
// };