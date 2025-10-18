import "./table.scss"

import * as React from "react"

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => (
  <div className="table-wrapper">
    <table ref={ref} className={`table ${className || ""}`} {...props} />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <thead ref={ref} className={`table__header ${className || ""}`} {...props} />
)
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tbody ref={ref} className={`table__body ${className || ""}`} {...props} />
)
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => <tfoot ref={ref} className={`table__footer ${className || ""}`} {...props} />
)
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(({ className, ...props }, ref) => (
  <tr ref={ref} className={`table__row ${className || ""}`} {...props} />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <th ref={ref} className={`table__head ${className || ""}`} {...props} />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(({ className, ...props }, ref) => (
  <td ref={ref} className={`table__cell ${className || ""}`} {...props} />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => <caption ref={ref} className={`table__caption ${className || ""}`} {...props} />
)
TableCaption.displayName = "TableCaption"

// Skeleton loading components
const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 3, columns = 4 }) => (
  <div className="table-wrapper">
    <table className="table table--loading">
      <thead className="table__header">
        <tr className="table__row">
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="table__head">
              <div className="table__skeleton table__skeleton--header" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table__body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex} className="table__row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="table__cell">
                <div className="table__skeleton table__skeleton--cell" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, TableSkeleton }
