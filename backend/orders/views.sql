 SELECT count(ojc.id) AS count,
    ojc.id,
    ind.id as industry_id,
    ojc.name,
    ind.icon,
    min(o.salary_from) AS min_from,
    min(o.salary_to) AS min_to
   FROM users_specialisation ojc
     JOIN users_industry ind ON ind.id = ojc.industry_id
     JOIN users_job o ON o.specialisation_id = ojc.id
	 JOIN btc_jobpayment bj on bj.job_id = o.id
	WHERE bj.expire_at > NOW()
  GROUP BY ojc.id, ojc.name, ind.icon, ind.id;