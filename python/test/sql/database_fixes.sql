-- Here are the fixes to make the test pass

CREATE OR REPLACE PROCEDURE get_project_costs (pid INT)
language plpgsql
as $$
begin
    SELECT SUM(ps.quantity * ps.unit_cost)
    FROM projects p
    JOIN project_supplies ps on p.id = ps.project_id
    WHERE p.id = pid;
end; $$;

CREATE OR REPLACE VIEW projects_and_supplies
AS
    SELECT p.name project, ps.name part, ps.quantity
    FROM projects p
    JOIN project_supplies ps on p.id = ps.project_id


