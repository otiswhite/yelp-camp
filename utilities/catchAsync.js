// function to wrap async functions and routes in order to catch async errors
module.exports = func => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};
