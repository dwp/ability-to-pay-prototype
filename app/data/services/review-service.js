function updateReviewStatus(statement) {
  const allValidated = statement.reviewItems.every(
    item => item.status === 'validated'
  )

  if (allValidated) {
    statement.reviewStatus = 'completed'
  } else {
    statement.reviewStatus = 'in-progress'
  }
}

module.exports = {
  updateReviewStatus
}