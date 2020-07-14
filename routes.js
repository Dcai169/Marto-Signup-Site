const express = require('../express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("signup-form");
});

router.post('/', (req, res) => {
    res.send("form posted");
})

module.exports = router;