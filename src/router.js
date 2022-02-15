const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const res = require('express/lib/response');
const { json } = require('express/lib/response');
const prisma = new PrismaClient();

const saltRounds = 5;
const secret = "mysecretkey";

const router = express.Router();


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, saltRounds)
    
    const user = await prisma.user.create({
        data: {
            username: username,
            password: hash
        }
    })

    res.json({ data: user })
});


const findUniqueUser = async username => {
    return await prisma.user.findUnique({
        where: { username: username }
    })
}

const createUserToken = username => {
    return jwt.sign(
        { username: username },
        secret
    )
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await findUniqueUser(username)
    if(!user) {
        console.log("ERROR: no user found in findUniqueUser")
        return
    }
    
    const match = bcrypt.compareSync(password, user.password)
    if (!match) {
        console.log("ERROR: username or password is incorrect")
        return
    }

    const token = createUserToken(username)
    res.json({ data: token })
});

module.exports = router;
