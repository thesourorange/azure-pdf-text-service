/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Mircrosft - PDF to Text Service' });
};