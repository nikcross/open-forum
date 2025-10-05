
SELECT
	column_name,data_type,is_nullable,column_default
FROM
	information_schema.COLUMNS
WHERE
	TABLE_NAME = '{{table name}}';
	