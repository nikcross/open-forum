create table tags (
  tag varchar(100)
);

create table tag_link (
  tag varchar(100),
  type varchar(100),
  name varchar(100),
  wild_card bool,
  case_sensitive bool,
);