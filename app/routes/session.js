function initialiseSession(req) {

  req.session.data.user ||= {
    id: 'ECM12345'
  }

  req.session.data.case ||= {
    statements: []
  }

  req.session.data.audit ||= []

}

module.exports = {
  initialiseSession
}
