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

#Created using data transform script - create-required-scheduled-tasks.js
INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'trigger.sjs','Automatic Rebuild','Every day at 02:00','','/OpenForum/Triggers/TimerTrigger/AutomaticRebuild');

INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'auto-update.sjs','Update AddOns','Every ten minutes','','/OpenForum/AddOn/Update');

INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'trigger.sjs','Create new hash','Every half hour','','/OpenForum/Authentication');

INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'collect-page-access-data.sjs','Log Page Access','Every ten seconds','','/OpenForum/AddOn/RemoteLogger/LogPageAccess');

INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'trigger.sjs','Log System Status','Every ten seconds','','/OpenForum/AddOn/RemoteLogger/LogSystemStatus');

INSERT INTO triggerschedule (enabled ,debug ,scriptfile ,name ,scheduledtime ,lastrun ,pagename ) values (true,false,'trigger.sjs','Manage Queues','Every ten seconds','','/OpenForum/Triggers/TimerTrigger/ManageQueues');