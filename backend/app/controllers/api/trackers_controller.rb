module Api
  class TrackersController < BaseController
    def index
      service = Redmine::EnumerationsService.new(redmine_client)
      data = service.trackers
      render json: data
    end
  end
end
