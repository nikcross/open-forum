//---- OpenForumTable ----

	function OpenForumTable(node) {
		this.rowNode = node;
		this.tableNode = node.parentNode;

      
      	if(this.tableNode.id) {
          this.id=this.tableNode.id;
        } else {
			this.id="OFTable"+OpenForum.getNextId();
      	} 
        
        node.parentNode.removeChild(node);

        var temp = document.createElement("table");
        temp.appendChild(node);

		this.rowHTML = temp.innerHTML;
		this.repeatFor = node.attributes['of-repeatFor'].value;
		this.target = this.repeatFor.substring(this.repeatFor.indexOf(" in ")+4);
		this.element = this.repeatFor.substring(0,this.repeatFor.indexOf(" in "));
		this.targetObject = OpenForum.getObject(this.target);
		this.targetObjectSignature = OpenForum.createObjectSignature( this.targetObject.getValue() );

		this.tableTop = this.tableNode.innerHTML;
		this.tableNode.id=this.id;

		this.setTableNode = function(newTableNode) {
			this.tableNode = newTableNode;
		};

		this.refresh = function() {
			//check if changed
			var objectSignature = OpenForum.createObjectSignature( this.targetObject.getValue() );
			if(objectSignature==this.targetObjectSignature) {
				return;
			}
			this.targetObjectSignature=objectSignature;

			var tableData = this.tableTop;
			var collection = this.targetObject.getValue();
			for( var elementIndex in collection ) {
				var item = collection[elementIndex];
                item.index = elementIndex;
				eval("var "+this.element+"=item;");

				var data = ""+this.rowHTML;
				while(data.indexOf(OpenForum.FIELD_DELIMETER_START)!=-1) {
					name = data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_START)+2,data.indexOf(OpenForum.FIELD_DELIMETER_END));
					data = data.substring(0,data.indexOf(OpenForum.FIELD_DELIMETER_START))+
					eval(name)+
					data.substring(data.indexOf(OpenForum.FIELD_DELIMETER_END)+2);
				}
				tableData += data;
			}
			this.tableNode.innerHTML=tableData;
		};
	}