 create table triggerSchedule (
	name text,
	pageName text,
	scriptFile text,
	lastRun text,
	scheduledTime text,
	enabled boolean,
	debug boolean
);
 
CREATE UNIQUE INDEX triggerSchedule_name_idx on triggerSchedule (name);
