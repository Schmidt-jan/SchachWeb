import play.api.http.HttpFilters
import play.filters.cors.CORSFilter

import javax.inject.Inject

class Filters @Inject() (corsFilter: CORSFilter) extends HttpFilters {
  def filters = Seq(corsFilter)
}