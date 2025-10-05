var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");

/*if(typeof println != "undefined") {
  var oldFn = test.postMessage;
  test.postMessage = function(message) {
    oldFn( "<xmp>"+message+"</xmp>" );
  };
}*/

renderer.setAliases( [
  {alias: "wiki", prefix: "http://www.wikipedia.org/"},
  {alias: "bbc", prefix: "http://www.bbc.co.uk/"}
] );

test.registerTestInstance( "renderer",renderer );

test.log("Running tests in /OpenForum/Javascript/Renderer/DefaultRenderer.sjs");


//==================================================================
test.unitTest("Can render unordered list").
                                                                given("pageName","MyPage").
                                                                and("content","* A \n* B \n* C \n").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>").
                                                                    run();

//==================================================================
test.unitTest("Can render unordered list offset from page").
                                                                given("pageName","MyPage").
																and("content"," * A \n * B \n * C \n").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>").
                                                                    run();

//==================================================================
test.unitTest("Can render unordered list followed by text").
                                                                given("pageName","MyPage").
                                                                and("content","* A \n* B \n* C \n\nsome trailing text").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>\nsome trailing text").
                                                                    run();

//==================================================================
test.unitTest("Can render ordered list").
                                                                given("pageName","MyPage").
                                                                and("content","# A \n# B \n# C \n").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<ol><li> A </li>\n<li> B </li>\n<li> C </li>\n</ol>").
                                                                    run();

//==================================================================
test.unitTest("Can render ordered list followed by text").
                                                                given("pageName","MyPage").
                                                                and("content","# A \n# B \n# C \n\nsome trailing text").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<ol><li> A </li>\n<li> B </li>\n<li> C </li>\n</ol>\nsome trailing text").
                                                                    run();

//==================================================================
test.unitTest("Can render bold").
                                                                given("pageName","MyPage").
                                                                and("content"," __Title__ ").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then(" <b>Title</b> ").
                                                                    run();

//==================================================================
test.unitTest("Can render mixed markup").
                                                                given("pageName","MyPage").
                                                                and("content"," __Title__ \n\n* A \n* B \n* C \n").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then(" <b>Title</b> \n\n<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>").
                                                                    run();

//==================================================================
test.unitTest("Can render heading").
                                                                given("pageName","MyPage").
																and("content","!!Title").
                                                                when( "renderer.render(pageName,content)" ).
																then("<h3>Title</h3>").
																run();

//==================================================================
test.unitTest("Can render headings with blank line").
                                                                given("pageName","MyPage").
                                                                and("content","!!Title 1\n\n!!Title 2\n").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<h3>Title 1</h3>\n\n<h3>Title 2</h3>\n").
                                                                    run();

//==================================================================
test.unitTest("Can render rule").
                                                                given("pageName","MyPage").
																and("content","----").
                                                                when( "renderer.render(pageName,content)" ).
																then("<hr/>").
																run();

//==================================================================
test.unitTest("Can render heading and rule").
                                                                given("pageName","MyPage").
																and("content","!!Title\n----\nSome Text").
                                                                when( "renderer.render(pageName,content)" ).
																then("<h3>Title</h3>\n<hr/>\nSome Text").
																run();

//==================================================================
test.unitTest("Can render local absolute link").
                                                                given("pageName","MyPage").
																and("content","[/TheLab]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"/TheLab\">/TheLab</a>").
																	run();

//==================================================================
test.unitTest("Can render link with parameter").
                                                                given("pageName","MyPage").
																and("content","[/TheLab?edit]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"/TheLab?edit\">/TheLab?edit</a>").
																	run();

//==================================================================
test.unitTest("Can render local absolute links with blank line").
                                                                given("pageName","MyPage").
																and("content","[/TheLab]\n\n[/TheLab]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"/TheLab\">/TheLab</a>\n\n<a href=\"/TheLab\">/TheLab</a>").
																	run();

//==================================================================
test.unitTest("Can render local absolute link with label").
                                                                given("pageName","MyPage").
																and("content","[Title|/TheLab]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"/TheLab\">Title</a>").
																	run();

//==================================================================
test.unitTest("Can render local relative link with label").
                                                                given("pageName","/OpenForum/Javascript").
																and("content","[Title|Renderer]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"/OpenForum/Javascript/Renderer\">Title</a>").
																	run();

//==================================================================
test.unitTest("Can render external link with label").
                                                                given("pageName","MyPage").
																and("content","[The BBC|http://www.bbc.co.uk]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"http://www.bbc.co.uk\" target=\"external_page\">The BBC</a>").
																	run();

//==================================================================
test.unitTest("Can render external link with alias").
                                                                given("pageName","MyPage").
																and("content","[Helicopter|wiki:helicopter]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<a href=\"http://www.wikipedia.org/helicopter\" target=\"external_page\">Helicopter</a>").
																	run();

//==================================================================
test.unitTest("Can render an image").
                                                                given("pageName","MyPage").
																and("content","[A Picture|/OpenForum/Images/open-forum-dog-small.png]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<img src=\"/OpenForum/Images/open-forum-dog-small.png\" alt=\"A Picture\" title=\"A Picture\"/>").
																	run();

//==================================================================
test.unitTest("Can render a table").
                                                                given("pageName","MyPage").
                                                                and("content","|A|B|C\n|1|2|3\n|x|y|z").
                                                                when( "renderer.render(pageName,content)" ).
                                                                then("<table><tr><td>A</td><td>B</td><td>C</td></tr>\n<tr><td>1</td><td>2</td><td>3</td></tr>\n<tr><td>x</td><td>y</td><td>z</td></tr></table>").
                                                                    run();

test.unitTest("Can render extension").
                                                                given("pageName","MyPage").
																and("content","[{Icon name=\"chart pie\"}]").
                                                                when( "renderer.render(pageName,content)" ).
																then("<!--Extension Icon name=\"chart pie\" --><img src=\"/OpenForum/Images/icons/png/chart_pie.png\"><!--End Extension Icon name=\"chart pie\" -->").
																	run();

var results = test.getResults();
test.log("Completed tests in /OpenForum/Javascript/Renderer/DefaultRenderer.sjs Tests:"+results.tests+" Passed:"+results.passed+" Failed:"+results.failed);