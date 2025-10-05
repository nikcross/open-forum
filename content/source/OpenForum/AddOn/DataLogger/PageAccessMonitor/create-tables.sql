#drop table page_access;

create table page_access (
	site        text,
	page_name   text,
	views_hour  numeric,
	views_day   numeric,
	views_Week  numeric,
	views_month numeric,
	views_year  numeric,
	last_hour  numeric,
	last_day   numeric,
	last_Week  numeric,
	last_month numeric,
	last_year  numeric
);

#drop table page_access_diary;

create table page_access_diary (
	site        text,
	page_name    text,
	date        numeric,
	views       numeric
);

create unique index page_access_index on page_access (site,page_name);

create unique index page_access_diary_index on page_access_diary (site,page_name,date);