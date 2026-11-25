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

# ===== User journeys (Marketing App). Only needed on open-forum, the one server that stores journeys. =====
# Every server sends its page views and events to open-forum (RemoteLogger/LogUserJourney); open-forum
# hashes IP addresses before storing them, so no raw IP address is kept.

create table if not exists user_journey (
	id          bigserial primary key,
	# sending server's serverName
	site        text,
	page_name   text,
	referrer    text,
	# campaign tags from the landing page's query string
	src         text,
	campaign    text,
	placement   text,
	time_stamp  bigint,
	# salted SHA-256 of IP address + user agent (first 32 hex characters)
	visitor_id  text,
	user_agent  text,
	user_name   text,
	# live or import
	source      text,
	# salted SHA-256 of the IP address alone, for excluding an address
	ip_hash     text
);

create index if not exists user_journey_site_time on user_journey (site, time_stamp);
create index if not exists user_journey_visitor_time on user_journey (visitor_id, time_stamp);

# visitor_salt (generated on first use, never shown) and import_next_line
create table if not exists user_journey_settings (
	setting_key    text primary key,
	setting_value  text
);

# One row per sending server, updated with every batch
create table if not exists user_journey_site (
	site_name        text primary key,
	web_address      text,
	last_batch_time  bigint
);

# Conversion events recorded by trackEvent (track-event.js)
create table if not exists marketing_event (
	id          bigserial primary key,
	site        text,
	app         text,
	step        text,
	time_stamp  bigint,
	visitor_id  text,
	ip_hash     text,
	page_name   text,
	user_name   text
);

create index if not exists marketing_event_site_time on marketing_event (site, time_stamp);

# Optional event details (trackEvent(app, step, {item, order}))
alter table marketing_event add column if not exists item text;
alter table marketing_event add column if not exists order_ref text;

# ===== Shops (Marketing App Shop view). Sent by each shop's RemoteLogger/LogShopOrders every ten minutes. =====
# No customer details are stored: no email addresses, no free-text extra_info.

create table if not exists shop_product (
	site        text,
	product_id  text,
	name        text,
	page        text,
	# price in pence
	price       integer,
	available   boolean,
	updated     bigint,
	primary key (site, product_id)
);

create table if not exists shop_order (
	site               text,
	order_id           text,
	# the shop's own status: in basket, recieved, paid
	status             text,
	order_time         bigint,
	item_count         integer,
	# pence, after coupons; total_inc_postage adds postage
	total              integer,
	postage            integer,
	total_inc_postage  integer,
	coupons            text,
	snapshot_hash      text,
	first_seen         bigint,
	# when open-forum first saw the current snapshot (used for abandoned baskets)
	last_change        bigint,
	# when open-forum first saw the order paid (its order time for orders already paid when first seen)
	paid_time          bigint,
	primary key (site, order_id)
);

create table if not exists shop_order_item (
	site        text,
	order_id    text,
	product_id  text,
	name        text,
	quantity    integer,
	price       integer,
	total       integer
);

create index if not exists shop_order_item_order on shop_order_item (site, order_id);
create index if not exists shop_order_paid on shop_order (site, paid_time);
