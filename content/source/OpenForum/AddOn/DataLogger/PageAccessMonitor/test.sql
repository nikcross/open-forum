
update page_access set page_access.views_day = sum( page_access.views_day + page_access.views_hour)
 where site='One Stone Soup (OpenForum)' and page_name='/HomePage';

update page_access set views_day = page_access.views_day + page_access.views_hour
 views_week = views_week + views_hour
 views_month = views_month + views_hour
 views_year = views_year + views_hour
 where site='One Stone Soup (OpenForum)' and page_name='/HomePage';

select * from page_access;

select * from page_access_diary;

