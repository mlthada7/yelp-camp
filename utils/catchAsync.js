module.exports = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
		// alur: error occurs -> catch error -> next(error) -> error handling middleware
	};
};
