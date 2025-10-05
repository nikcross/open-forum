# Author
# Decription

@schema=open-forum;

SELECT *, to_timestamp(time_stamp / 1000) as date FROM data_logger where device_id='pump_house' and data_key='using' and data_value > 0 order by time_stamp asc limit 100;

select max(to_timestamp(time_stamp / 1000)) from data_logger where device_id='pump_house';

select distinct device_id from data_logger;

select count(*) from data_logger;
			 