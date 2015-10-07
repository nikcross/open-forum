temp = file;

newFile = {};
newFile.javaFile = file;
file = newFile;

file.getPageInheritedFilePath = function(arg0,arg1) {
  return ""+file.javaFile.getPageInheritedFilePath(arg0,arg1);
};

println(file.javaFile);
println(file.getPageInheritedFilePath("/OpenForum","page.wiki"));
println(typeof(file.getPageInheritedFilePath("/OpenForum","page.wiki")));

println(temp.getPageInheritedFilePath("/OpenForum","page.wiki"));
println(typeof(temp.getPageInheritedFilePath("/OpenForum","page.wiki")));
        
        