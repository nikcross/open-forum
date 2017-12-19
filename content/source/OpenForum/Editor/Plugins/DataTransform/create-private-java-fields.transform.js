output = input.replace(/ = addNode\(.*\)/g,"");
output = output.replace(/ {8}\/\/.*\n/g,"");
output = output.replace(/ {8}/g,"    private NNode ");