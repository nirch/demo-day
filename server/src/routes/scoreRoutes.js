const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { putScoresValidators } = require('../validators/scoreValidators');
const scoreController = require('../controllers/scoreController');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(requireRole('judge'));

router.get('/teams/scores-summary', scoreController.getScoresSummary);
router.get('/teams/:teamId/scores', scoreController.getScores);
router.put('/teams/:teamId/scores', putScoresValidators, validate, scoreController.putScores);

module.exports = router;
