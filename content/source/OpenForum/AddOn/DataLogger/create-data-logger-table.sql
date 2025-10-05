DROP TABLE IF EXISTS data_logger;
create table data_logger(
service_id        text,
device_type       text,
device_id         text,
data_Key        text,
data_value        numeric,
time_stamp        numeric
)