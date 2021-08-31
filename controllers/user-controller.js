const { User, Thought } = require('../models');

const userController = {
    // get all users
    getAllUsers(req, res) {
        User.find({})
            .populate({
                path: 'thoughts',
                // we don't want __v field to be returned along with our returning data
                select: '-__v'
            })
            // same goes for returning user data
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // get one user by id
    getUserById({ params }, res) {
        User.findOne({ _id: params.userId })
        // getting a single data also populates thoughts
        .populate({
            path: 'thoughts',
            select: '-__v'
        })
        .select('-__v')
        .then(dbUserData => {
            // If no user found, send 404
            if (!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!'});
                return;
            }
            res.json(dbUserData);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },

    // create a user
    createUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },

    // update a user by id
    updateUser({ params, body }, res) {
        User.findOneAndUpdate(
            { _id: params.userId },
            body,
            { new: true, runValidators: true })
            .populate({
                path: 'thoughts',
                select: '-__v'
            })
            .then(dbUserData => {
                if(!dbUserData) {
                    res.status(400).json({ message: 'No user found with this id!'});
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },

    // delete a user
    deleteUser({ params }, res) {
        User.findOneAndDelete(
            { _id: params.userId },
            { thoughts: params.thoughtId })
          .then(dbUserData => {
            if (!dbUserData) {
              return res.status(404).json({ message: 'No user found with this id!' });
            }  
              // get user id and delete their associate thoughts
              return Thought.deleteMany({ _id: { $in: dbUserData.thoughts}
            })
            .then(() => {
                res.json({ message: 'User and associated thoughts deleted!' });
            })
            .catch(err => res.status(400).json(err));
        
        })
    },

    // add a friend
    addFriend({params}, res) {
        User.findOneAndUpdate(
            { _id: params.userId }, 
            { $addToSet: { friends: params.friendId } }, 
            { new: true })
        .select('-__v')    
        .then((dbUserData) => {
            if (!dbUserData) {
            return res.status(404).json({ message: 'No user found with this id!' });
            }
            res.json(dbUserData);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
    },

    // Remove a friend
    removeFriend({ params }, res) {
        User.findOneAndUpdate(
            { _id: params.userId }, 
            { $pull: { friends: params.friendId } }, 
            { new: true })
        .then((dbUserData) => {
            if (!dbUserData) {
            return res.status(404).json({ message: 'User with this ID does not exist.' });
            }
            res.json(dbUserData);
        })
        .catch((err) => {
            console.log(err);
            res.status(400).json(err);
        });
    }

};

module.exports = userController;
