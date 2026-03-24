const { Router } = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { createTeamValidators, updateTeamValidators } = require('../validators/teamValidators');
const teamController = require('../controllers/teamController');

const router = Router({ mergeParams: true });

router.use(auth);
router.use(requireRole('admin'));

router.get('/', teamController.listTeams);
router.post('/', createTeamValidators, validate, teamController.createTeam);
router.put('/:teamId', updateTeamValidators, validate, teamController.updateTeam);
router.delete('/:teamId', teamController.deleteTeam);

module.exports = router;
