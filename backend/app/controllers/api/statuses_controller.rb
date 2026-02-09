module Api
  class StatusesController < BaseController
    def index
      service = Redmine::EnumerationsService.new(redmine_client)
      data = service.statuses
      render json: data
    end
  end
end
