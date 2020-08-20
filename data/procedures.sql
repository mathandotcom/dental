DROP procedure IF EXISTS `jdsp_update_template`;

DELIMITER $$

CREATE PROCEDURE jdsp_update_template (
	IN __category_id INT,			
	IN __subcategory_id INT,
	IN __categorymapping_id INT,
	IN __template_type_id INT,
    IN __template_type_name varchar(500),
    IN __template_id INT,
    IN __template_subject VARCHAR(500),
    IN __template_body VARCHAR(5000),
    IN __template_trigger_id VARCHAR(500), -- comma seperated
    IN __createdby    INT,
	OUT __result varchar(100)
) 
BEGIN
	DECLARE typeCount INT DEFAULT 0;
	DECLARE temp_template_type_id INT DEFAULT 0;
    DECLARE tempEventId INT  DEFAULT 0;
    DECLARE strIDs varchar(100);
    DECLARE strLen    INT DEFAULT 0;
	DECLARE SubStrLen INT DEFAULT 0;
    -- DECLARE result varchar(1000);
  
    -- insert or udpate templatetypename data
    if (__template_type_id > 0) then
		update templatetypename set name = __template_type_name, updatedby = __createdby where id = __template_type_id;
        SET temp_template_type_id = __template_type_id;
        set __result = 'updated';
	else
		insert into templatetypename (categorymapping_id, name, createdby) 
        values (__categorymapping_id, __template_type_name, __createdby);
        SET temp_template_type_id = LAST_INSERT_ID();
        set __result = 'inserted';
    end if;
    
    if(temp_template_type_id > 0 and __template_id > 0) then
		update templates set 
                                subject = __template_subject,
                                bodycontent = __template_body,
                                updatedby = __createdby
                                where id = __template_id;
		update trigger_event set active = 0 where template_id = __template_id;
	elseif(temp_template_type_id > 0 and __template_id <= 0) then
		insert into templates (templatetypename_id, subject, bodycontent, createdby) 
			values (temp_template_type_id, __template_subject, __template_body, __createdby);
        set __template_id = LAST_INSERT_ID();
    end if;
    
    -- assign template_trigger_id to strIDs
	IF __template_trigger_id IS NULL or __template_trigger_id = '' THEN
		SET strIDs = '';
	else
		SET strIDs = __template_trigger_id;
	END IF;    
    
    -- update or insert trigger event data with respect to template
    if(__template_id > 0 and __template_trigger_id != '') then
		-- set result = strIDs;
        -- set result = 'aa';
        
		do_this:
		  LOOP
          SET typeCount = 0;
			SET strLen = CHAR_LENGTH(strIDs);
            set tempEventId  = SUBSTRING_INDEX(strIDs, ',', 1);
			select count(distinct concat(template_id, event_id)) into typeCount from trigger_event where template_id = __template_id and event_id = tempEventId;
            -- set result = CONCAT(result, ',', template_id, ',', tempEventId, ',', typeCount); -- , ',', SUBSTRING_INDEX(strIDs, ',', 1), ',', template_id);
            
            if(typeCount > 0) then
				UPDATE trigger_event SET active = 1 WHERE template_id = __template_id and event_id =  tempEventId;
				-- set result = CONCAT(result, ',', SUBSTRING_INDEX(strIDs, ',', 1), ',', template_id);
            else
			 	insert into trigger_event (template_id, event_id, category_id, subcategory_id, created_by)
                 values (__template_id, SUBSTRING_INDEX(strIDs, ',', 1), __category_id, __subcategory_id, __createdby);
            end if;

			SET SubStrLen = CHAR_LENGTH(SUBSTRING_INDEX(strIDs, ',', 1)) + 2;
			SET strIDs = MID(strIDs, SubStrLen, strLen);

			IF strIDs = '' THEN
			  LEAVE do_this;
			END IF;
		END LOOP do_this;
    end if;
    commit;
    select __result, temp_template_type_id as tempTypeId;
END$$

DELIMITER ;

-- call jdsp_update_template(1, 1, 1, 71, 'New Appointment - somthing', 44, 'bbb - bbbb', 'ccc - cccc', '4,5,3', 1, @result); select @result;
-- call jdsp_update_template(1, 1, 1, 71, 'New Appointment - somthing', 44, 'bbb', '<p>ccc</p>', '3,5,4', 1, @result);select @result;

-- ***************************************************************************************************************************

DROP procedure IF EXISTS `jdsp_update_schedler_status`;
DELIMITER $$

CREATE PROCEDURE jdsp_update_schedler_status (
	IN __id INT,	
    IN __scheduler_id INT,
    IN __last_job_run DATETIME,
    IN __next_job_frequency INT,
    IN __created_by INT
)
BEGIN
	DECLARE temp_status_id INT DEFAULT 0;
    
	IF(__scheduler_id > 0) then
		Select count(*) into temp_status_id from scheduler_status where scheduler_id = __scheduler_id;
        IF(temp_status_id > 0) THEN
			update scheduler_status set 
			last_job_run = __last_job_run,
            next_job_frequency = __next_job_frequency,
            updated_by = __created_by,
            updatedon = __last_job_run
            where scheduler_id = __scheduler_id;
            SET temp_status_id = __id;
		ELSE
			insert into scheduler_status (scheduler_id, last_job_run, next_job_frequency, created_by) 
            values (__scheduler_id, __last_job_run, __next_job_frequency, __created_by);
            SET temp_status_id = LAST_INSERT_ID();
        END IF;
	ELSE
		SET temp_status_id = 0;
    END IF;
    select temp_status_id;
END$$

DELIMITER ;