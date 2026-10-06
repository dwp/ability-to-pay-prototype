module.exports = function (router) {
  router.get('/upload', (req, res) => {
    res.render('upload/index')
  })

  router.post('/upload', (req, res) => {

    delete req.session.data.prototypeReset
    
    req.session.data.upload ||= {}

    req.session.data.upload.filename =
      req.body.fileUpload1 || ''

    res.redirect('/bank')
  })
}