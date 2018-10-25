var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

const puppeteer = require('puppeteer');

var app = express();

//View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//render our index page initially
app.get('/', function(req, res){
	res.render('index');
});

app.post('/results', function(req, res){

	(async function main(){
		try{
			const browser = await puppeteer.launch({headless: true});
			const page = await browser.newPage();

			//visit the desired webpage and enter our text into the search bar
			await page.goto('https://www.imdb.com');
			await page.type('#navbar-query', req.body.search_text);

			await page.click('#navbar-submit-button');

			//wait for main div to load on the results page
			await page.waitForSelector('#main');
			
			const result = await page.evaluate(() => {
				var data = [];
				var elements = document.querySelectorAll('.findSection');

				for(var element of elements){


					var elementArray = [];
					//push the section header onto our array
					elementArray.push(element.querySelector('.findSectionHeader').innerText);

					var infoSection = element.querySelectorAll('.result_text');

					//push the rest of the section onto our array
					for(var info of infoSection){
						elementArray.push(info.innerText);
					}


					data.push(elementArray);

				}
				return data;
			});

			//render our results.ejs page with our search data
			res.render('results', {
				search_text : req.body.search_text,
				search_results : result
			});

		}catch(e){
			console.log(e);
		}
	})();

});


app.listen(3000, function(){
	console.log("Server Started on Port 3000");
})