UPDATE email_log,
(
	SELECT
		email_log.id,
		email_log.project_id,
		REGEXP_SUBSTR(
			REGEXP_REPLACE(
				REGEXP_SUBSTR(email_log.subject, '^\\[.*\\]:'),
				'\\[(.*)\\]:',
				'$1'
			),
			'[^0-9]+'
		) as project_name,
		projects.id as project_id_to_update
	FROM email_log
	LEFT JOIN projects ON projects.name = REGEXP_SUBSTR(
			REGEXP_REPLACE(
				REGEXP_SUBSTR(email_log.subject, '^\\[.*\\]:'),
				'\\[(.*)\\]:',
				'$1'
			),
			'[^0-9]+'
		)
	WHERE email_log.project_id IS NULL
	AND REGEXP_SUBSTR(email_log.subject, '^\\[.*\\]:') != ''
	ORDER BY email_log.id
) sub_query
SET email_log.project_id = sub_query.project_id_to_update
WHERE email_log.id = sub_query.id

# you can copy the sub query without the WHERE email_log IS NULL clause to see what data I saw
# since there are no records such as that left in the system after this query was run

# since there's only one active organization using this system I did not have to worry about project name clashes
