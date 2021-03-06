const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

const value = guid();

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

module.exports = (data) => {
    function getPostById(req, res) {
        let isAutenticated = false;
        let user;
        if (req.isAuthenticated()) {
            user = req.user;
            isAutenticated = true;
        }

        const id = req.params.postId;
        return data.posts.findById(id)
            .then((post) => {
                res.render('forum-post', {
                    'user': user,
                    'isAutenticated': isAutenticated,
                    'post': post,
                });
            });
    }

    function getAll(req, res) {
        let isAutenticated = false;
        let user;
        if (req.isAuthenticated()) {
            user = req.user;
            isAutenticated = true;
        }
        return data.posts.getAllSortedByDate()
            .then((posts) => {
                res.cookie(value, 'session', { maxAge: 9999 });
                res.render('home', {
                    'user': user,
                    'isAutenticated': isAutenticated,
                    'posts': posts,
                });
            });
    }

    function updatePostById(req, res) {
        const postId = req.body.postId;
        const node = +req.body.node;
        const postType = req.body.postType;
        return data.posts.updateLikes(postId, node, postType)
            .then(() => {
                res.cookie(postId + postType, '', { maxAge: 9999 });
                res.status(200).send();
            });
    }

    function newPostForm(req, res) {
        if (!req.isAuthenticated()) {
            res.status(401).redirect('/api/users/login');
            return;
        }

        res.render('new-forum-post', {
            user: req.user,
            isAutenticated: true,
        });
    }

    function newPost(req, res) {
        if (!req.isAuthenticated()) {
            return Promise.resolve(
                res.status(401).redirect('/api/users/login')
            );
        }

        return data.posts.create(req.body, req.user)
            .then(() => {
                res.redirect('/');
            })
            .catch((error) => {
                res.render('new-forum-post', { inavalid: error });
            });
    }

    return {
        getPostById,
        getAll,
        updatePostById,
        newPostForm,
        newPost,
    };
};
