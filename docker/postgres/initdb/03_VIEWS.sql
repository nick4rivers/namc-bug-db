/******************************************************************************************************************
 geo SCHEMA
 */
CREATE VIEW Geo.vwSites AS
(
SELECT s.SiteID,
       s.SiteName,
       s.SystemID,
       sy.SystemName,
       s.EcosystemID,
       e.EcosystemName,
       s.Waterbody,
       ST_X(s.location) Longitude,
       ST_Y(s.location) Latitude,
       s.CreatedDate,
       s.UpdatedDate
FROM Geo.sites s
         LEFT JOIN Geo.Systems sy ON s.SystemID = sy.systemID
         LEFT JOIN Geo.Ecosystems e ON s.EcosystemID = e.EcosystemID
    );

/******************************************************************************************************************
entity SCHEMA
*/

CREATE VIEW Entity.vwOrganizations AS
(
SELECT o.*,
       t.OrganizationTypeName,
       e.Address1,
       e.Address2,
       e.City,
       s.StateName,
       c.CountryName,
       e.ZipCode,
       e.Phone,
       e.Fax
FROM Entity.Organizations o
         INNER JOIN Entity.Entities e ON o.EntityID = e.EntityID
         INNER JOIN Entity.OrganizationTypes t ON o.OrganizationTypeID = t.OrganizationTypeID
         INNER JOIN Geo.Countries c ON e.countryID = c.CountryID
         LEFT JOIN Geo.States s ON e.StateID = s.StateID
    );

CREATE VIEW Entity.vwIndividuals AS
(
SELECT i.*,
       o.OrganizationName AS Affiliation,
       e.Address1,
       e.Address2,
       e.City,
       s.StateName,
       c.CountryName,
       e.ZipCode,
       e.Phone,
       e.Fax
FROM Entity.Individuals i
         INNER JOIN Entity.Entities e ON i.EntityID = e.EntityID
         INNER JOIN Geo.Countries c ON e.CountryID = c.CountryID
         LEFT JOIN Geo.States s ON e.StateID = s.StateID
         LEFT JOIN Entity.Organizations o ON i.AffiliationID = o.OrganizationID
    );

/******************************************************************************************************************
 sample SCHEMA
 */

CREATE VIEW sample.vwBoxes AS
(
SELECT b.BoxID,
       b.CustomerID,
       COUNT(SampleID) AS Samples,
       b.SubmitterID,
       b.BoxStateID,
       t.BoxStateName,
       b.BoxReceviedDate,
       b.ProcessingCompleteDate,
       b.ProjectedCompleteDate,
       Sum(s.SortTime) SortTime,
       Sum(s.IDTime) IDTime,
       b.ProjectID,
       p.ProjectName
FROM Sample.Boxes b
         INNER JOIN Sample.BoxStates t ON b.BoxStateID = t.BoxStateID
         LEFT JOIN Sample.Samples s ON b.BoxID = s.BoxID
         LEFT JOIN Sample.Projects p ON b.ProjectID = p.ProjectID
GROUP BY b.BoxID,
         b.CustomerID,
         b.SubmitterID,
         b.BoxStateID,
         t.BoxStateName,
         b.BoxReceviedDate,
         b.ProcessingCompleteDate,
         b.ProjectedCompleteDate,
         b.ProjectID,
         b.ProjectID,
         p.ProjectName
    );

CREATE VIEW sample.vwSamples AS
(
SELECT s.SampleID,
       s.BoxID,
       s.SiteID,
       si.SiteName,
       s.SampleDate,
       s.SampleTime,
       s.TypeID,
       t.SampleTypeName,
       s.MethodID,
       m.SampleMethodName,
       s.HabitatID,
       h.HabitatName,
       s.Area,
       s.FieldSplit,
       s.LabSplit,
       s.JarCount,
       s.Qualitative,
       s.Mesh,
       s.SorterCount,
       s.SorterID,
       s.SortTime,
       s.SortStartDate,
       s.SortEndDate,
       s.IDerID,
       s.IDTime,
       s.IDStartDate,
       s.IDEndDate,
       s.CreatedDate,
       s.UpdatedDate,
       s.QASampleID,
       s.LabID,
       l.OrganizationName AS LabName

FROM sample.samples s
         INNER JOIN Sample.sampleTypes t ON s.TypeID = t.SampleTypeID
         INNER JOIN Sample.SampleMethods m ON s.MethodID = m.SampleMethodID
         INNER JOIN Geo.Habitats h ON s.HabitatID = h.HabitatID
         LEFT JOIN Geo.Sites si ON s.SiteID = si.SiteID
         LEFT JOIN Entity.Organizations l ON s.LabID = l.OrganizationID
    );