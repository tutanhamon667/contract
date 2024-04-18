
CREATE OR REPLACE VIEW public.job_categories_info
 AS
 SELECT count(ojc.id) AS count,
    ojc.id,
    ojc.name,
	ojc.icon,
    min(o.salary) AS min_one,
    min(o.salary_from) AS min_from,
    min(o.salary_to) AS min_to
   FROM users_specialisation ojc
     JOIN users_job o ON o.specialisation_id = ojc.id
  GROUP BY ojc.id, ojc.name, ojc.icon;

ALTER TABLE public.job_categories_info
    OWNER TO contract;
