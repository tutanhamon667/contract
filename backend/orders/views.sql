-- View: public.job_categories_info

-- DROP VIEW public.job_categories_info;

CREATE OR REPLACE VIEW public.job_categories_info
 AS
 SELECT count(ojc.id) AS count,
    ojc.jobcategory_id,
    oj.name,
    min(o.salary) AS min_one,
    min(o.salary_from) AS min_from
   FROM orders_job_category ojc
     JOIN orders_jobcategory oj ON oj.id = ojc.jobcategory_id
     JOIN orders_job o ON o.id = ojc.job_id
  GROUP BY ojc.jobcategory_id, oj.name;

ALTER TABLE public.job_categories_info
    OWNER TO contract;

