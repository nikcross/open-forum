var renderer = js.getObject("/OpenForum/Javascript/Renderer","DefaultRenderer.sjs");
var tester = js.getObject("/OpenForum/Javascript/Tester","Test.sjs");

renderer.setAliases( [
  {alias: "wiki", prefix: "http://www.wikipedia.org/"},
  {alias: "bbc", prefix: "http://www.bbc.co.uk/"}
] );

function render(pageName) {
  return function (content) {
    return renderer.render(pageName,content);
  };
}

tester.log("Running tests in /OpenForum/Javascript/Renderer/DefaultRenderer.sjs");

//==================================================================
tester.unitTest("Can render unordered list").
                                                                given("* A \n* B \n* C \n").
                                                                when( render("MyPage") ).
                                                                then("<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>").
                                                                    run();

//==================================================================
tester.unitTest("Can render unordered list followed by text").
                                                                given("* A \n# B \n# C \n\nsome trailing text").
                                                                when( render("MyPage") ).
                                                                then("<ol><li> A </li>\n<li> B </li>\n<li> C </li>\n</ol>\nsome trailing text").
                                                                    run();

//==================================================================
tester.unitTest("Can render ordered list").
                                                                given("* A \n# B \n#C \n").
                                                                when( render("MyPage") ).
                                                                then("<o><li> A </li>\n<li> B </li>\n<li> C </li>\n</ol>").
                                                                    run();

//==================================================================
tester.unitTest("Can render ordered list followed by text").
                                                                given("* A \n* B \n* C \n\nsome trailing text").
                                                                when( render("MyPage") ).
                                                                then("<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>\nsome trailing text").
                                                                    run();

//==================================================================
tester.unitTest("Can render bold").
                                                                given(" __Title__ ").
                                                                when( render("MyPage") ).
                                                                then(" <b>Title</b> ").
                                                                    run();

//==================================================================
tester.unitTest("Can render mixed markup").
                                                                given(" __Title__ \n\n* A \n* B \n* C \n").
                                                                when( render("MyPage") ).
                                                                then(" <b>Title</b> \n\n<ul><li> A </li>\n<li> B </li>\n<li> C </li>\n</ul>").
                                                                    run();

//==================================================================
tester.unitTest("Can render heading").
																given("!!Title").
																when( render("MyPage") ).
																then("<h3>Title</h3>").
																run();

//==================================================================
tester.unitTest("Can render headings with blank line").
                                                                given("!!Title 1\n\n!!Title 2\n").
                                                                when( render("MyPage") ).
                                                                then("<h3>Title 1</h3>\n\n<h3>Title 2</h3>\n").
                                                                    run();

//==================================================================
tester.unitTest("Can render rule").
																given("----").
																when( render("MyPage") ).
																then("<hr/>").
																run();

//==================================================================
tester.unitTest("Can render heading and rule").
																given("!!Title\n----\nSome Text").
																when( render("MyPage") ).
																then("<h3>Title</h3>\n<hr/>\nSome Text").
																run();

//==================================================================
tester.unitTest("Can render local absolute link").
																given("[/TheLab]").
																when( render("MyPage") ).
																then("<a href=\"/TheLab\">/TheLab</a>").
																	run();

//==================================================================
tester.unitTest("Can render local absolute links with blank line").
																given("[/TheLab]\n\n[/TheLab]").
																when( render("MyPage") ).
																then("<a href=\"/TheLab\">/TheLab</a>\n\n<a href=\"/TheLab\">/TheLab</a>").
																	run();

//==================================================================
tester.unitTest("Can render local absolute link with label").
																given("[Title|/TheLab]").
																when( render("MyPage") ).
																then("<a href=\"/TheLab\">Title</a>").
																	run();

//==================================================================
tester.unitTest("Can render local relative link with label").
																given("[Title|Renderer]").
																when( render("/OpenForum/Javascript") ).
																then("<a href=\"/OpenForum/Javascript/Renderer\">Title</a>").
																	run();

//==================================================================
tester.unitTest("Can render external link with label").
																given("[The BBC|http://www.bbc.co.uk]").
																when( render("MyPage") ).
																then("<a href=\"http://www.bbc.co.uk\" target=\"external_page\">The BBC</a>").
																	run();

//==================================================================
tester.unitTest("Can render external link with alias").
																given("[Helicopter|wiki:helicopter]").
																when( render("MyPage") ).
																then("<a href=\"http://www.wikipedia.org/helicopter\" target=\"external_page\">Helicopter</a>").
																	run();

//==================================================================
tester.unitTest("Can render an image").
																given("[A Picture|/OpenForum/Images/open-forum-dog-small.png]").
																when( render("MyPage") ).
																then("<img src=\"/OpenForum/Images/open-forum-dog-small.png\" alt=\"A Picture\" title=\"A Picture\"/>").
																	run();

//==================================================================
tester.unitTest("Can render a table").
                                                                given("|A|B|C\n|1|2|3\n|x|y|z").
                                                                when( render("MyPage") ).
                                                                then("<table><tr><td>A</td><td>B</td><td>C</td></tr>\n<tr><td>1</td><td>2</td><td>3</td></tr>\n<tr><td>x</td><td>y</td><td>z</td></tr></table>").
                                                                    run();

tester.unitTest("Can render extension").
																given("[{Icon name=\"chart pie\"}]").
																when( render("MyPage") ).
																then("<img src=\"/OpenForum/Images/icons/png/chart_pie.png\">").
																	run();

var results = tester.getResults();
tester.log("Completed tests in /OpenForum/Javascript/Renderer/DefaultRenderer.sjs Tests:"+results.tests+" Passed:"+results.passed+" Failed:"+results.failed);