const accountRouter = require('./Account');
const adminRouter = require('./Admin');
const clbRouter = require('./CLB');

function route(app){

    app.use('/', accountRouter);

    app.use('/admin', adminRouter)

    app.use('/clb', clbRouter)
    
}

module.exports = route;