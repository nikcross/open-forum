insert into triggerSchedule values( 'Create new hash','/OpenForum/Authentication','trigger.sjs',null,'Every half hour',true,false );
insert into triggerSchedule values( 'Auto Update','/OpenForum/AddOn/Update','auto-update.sjs',null,'Every ten minutes',true,false );
insert into triggerSchedule values( 'System State Logger','/OpenForum/AddOn/RemoteLogger/LogSystemStatus','trigger.sjs',null,'Every ten seconds',true,false );
insert into triggerSchedule values( 'Manage Queues','/OpenForum/Triggers/TimerTrigger/ManageQueues','trigger.sjs',null,'Every ten seconds',true,false );
insert into triggerSchedule values( 'Automatic Rebuild','/OpenForum/Triggers/TimerTrigger/AutomaticRebuild','trigger.sjs',null,'Every day at 01:00',true,false );