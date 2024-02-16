-- View: public.job_categories_info

-- DROP VIEW public.job_categories_info;

CREATE OR REPLACE VIEW public.job_categories_info
 AS
 SELECT count(ojc.id) AS count,
    ojc.id,
    ojc.name,
    min(o.salary) AS min_one,
    min(o.salary_from) AS min_from
   FROM users_specialisation ojc
     JOIN users_job o ON o.id = ojc.job_id
  GROUP BY ojc.id, ojc.name;

ALTER TABLE public.job_categories_info
    OWNER TO contract;

